#!/usr/bin/env python3
"""
PocketPads static wiring check. Run from the project root:   python3 tests/wiring_check.py
Checks that every file points at something that exists, without running the app.
"""
import re, sys, os, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
P = F = W = 0
def ok(name, detail=""): global P; P += 1; print("  PASS", name)
def bad(name, detail=""): global F; F += 1; print("  FAIL", name, ("\n         -> " + detail) if detail else "")
def warn(name, detail=""): global W; W += 1; print("  WARN", name, ("\n         -> " + detail) if detail else "")
def section(t): print("\n== " + t)
def read(p): return open(p.replace("\\", "/"), encoding="utf-8").read()
def code_only(src):
    """JS/PHP source without comments and without quoted strings (so words in text are not mistaken for code)"""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"(?m)^\s*//.*$|(?<=[;{}\s,])//[^\n]*", "", src)
    src = re.sub(r"`[^`]*`", "``", src)
    src = re.sub(r"'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"", "''", src)
    return src

def slashes(paths): return sorted(p.replace("\\", "/") for p in paths)   # Windows glob gives Model\x.js; index.html uses Model/x.js
js_files  = slashes(glob.glob("Model/*.js") + glob.glob("Controller/*.js") + glob.glob("View/*.js") + glob.glob("Router/*.js"))
php_files = slashes(glob.glob("api/*.php"))
html = read("index.html")

# ------------------------------------------------------------------ 1. index.html
section("1. index.html loads the right files, once, in a workable order")
srcs = re.findall(r'<script[^>]*\ssrc="([^"]+)"', html)
local = [s for s in srcs if not s.startswith("http") and not s.startswith("Libraries/")]
missing = [s for s in local if not os.path.isfile(s)]
(bad if missing else ok)("every local <script src> exists" , ", ".join(missing))
if missing:
    print("         (If you are running this inside the downloaded folder only, it holds just the NEW/CHANGED files.\n"
          "          Copy it over your full project first, then run: python3 tests/wiring_check.py from the project root.)")
dups = sorted({s for s in local if local.count(s) > 1})
(bad if dups else ok)("no script is loaded twice", ", ".join(dups))
orphans = [f for f in js_files if f not in local]
(bad if orphans else ok)("every Model/Controller/View/Router file is loaded by index.html", ", ".join(orphans))
libs = sorted({s for s in srcs if s.startswith("Libraries/")})
warn("Libraries/ files are not part of this check (not in the project copy)", ", ".join(libs))

# ------------------------------------------------------------------ 2. JS globals
section("2. JavaScript globals: every Model / Controller / View / Service that is used is defined and loaded")
defs = {}        # name -> (file, set(members))
for f in js_files:
    src = read(f)
    for m in re.finditer(r'^const (\w+)\s*=\s*\{', src, re.M):
        name, start = m.group(1), m.end()
        end = src.find("\n};", start)
        body = src[start:end if end != -1 else len(src)]
        members = set(re.findall(r'^    (?:async\s+)?(\w+)\s*(?:\(|:)', body, re.M))
        defs[name] = (f, members)
    for m in re.finditer(r'^const (\w+)\s*=\s*\(?(?:\)\s*=>|\(\)\s*=>)', src, re.M):
        defs.setdefault(m.group(1), (f, set()))
    for m in re.finditer(r'window\.(\w+)\s*=\s*\{', src):       # e.g. window.AnimationKit = {...}
        defs.setdefault(m.group(1), (f, set()))
print("  (%d globals defined across %d JS files)" % (len(defs), len(js_files)))
IGNORE = set("""Swal Math JSON Object Array Promise Number String Date Vue VueRouter AOS Headers Request Intl Set Map Event
FormData FileReader Error Notification Boolean RegExp Symbol URL flatpickr axios Response Image Node MouseEvent""".split())
unknown, badmember = {}, []
for f in js_files + ["index.html"]:
    src = read(f)
    for m in re.finditer(r'(?<![\w.$])([A-Z][A-Za-z0-9]+)\.(\w+)', src):
        obj, mem = m.group(1), m.group(2)
        if obj in IGNORE: continue
        if obj in defs:
            if defs[obj][1] and mem not in defs[obj][1]:
                badmember.append("%s uses %s.%s but %s has no '%s'" % (f, obj, mem, defs[obj][0], mem))
        elif re.search(r'(Model|Controller|Service|Portal|Kit|Router)$', obj):
            unknown.setdefault(obj, set()).add(f)
(bad if unknown else ok)("every XxxModel / XxxController / XxxService / XxxPortal that is called is defined", "; ".join("%s (in %s)" % (k, ", ".join(sorted(v))) for k, v in unknown.items()))
bm = sorted(set(badmember))
(bad if bm else ok)("every method called on a project object exists on that object", "\n         -> ".join(bm))
# components used in routes / components:{...}
route_src = re.sub(r"(?m)^\s*//.*$|\s//[^\n]*", "", read("Router/dashboard.js"))
comps = set(re.findall(r'component:\s*(\w+)', route_src))
comps |= set(c for blk in re.findall(r'components:\s*\{([^}]*)\}', "\n".join(read(f) for f in js_files)) for c in re.findall(r'\w+', blk))
nodef = sorted(c for c in comps if c not in defs)
(bad if nodef else ok)("every component used by the router / components:{} is defined", ", ".join(nodef))
# defined-before-use at the file level (top-level references)
order = {s: i for i, s in enumerate(local)}
late = []
for f in local:
    if not f.endswith(".js") or not os.path.isfile(f): continue
    src = read(f)
    for name in comps:
        if name in defs and defs[name][0] != f and re.search(r'(?<![\w.])%s(?![\w])' % name, code_only(re.split(r"\n\s*(?:methods|async \w+\(|\w+\(\) \{)", src.split("template:")[0] if "template:" in src else src)[0])):
            if order.get(defs[name][0], -1) > order[f]:
                late.append("%s uses %s but %s loads later" % (f, name, defs[name][0]))
(bad if late else ok)("components are defined before the files that reference them load", "; ".join(late))

# ------------------------------------------------------------------ 3. API references
section("3. Every api/*.php the JavaScript calls exists (exact upper/lower case)")
real = {os.path.basename(p) for p in php_files}
real_lower = {n.lower(): n for n in real}
calls = {}
for f in js_files + ["index.html"]:
    for m in re.finditer(r'api/([A-Za-z0-9_]+\.php)', read(f)):
        calls.setdefault(m.group(1), set()).add(f)
notfound = [n for n in calls if n.lower() not in real_lower]
(bad if notfound else ok)("every called endpoint file exists", ", ".join(notfound))
case = [(n, real_lower[n.lower()]) for n in calls if n.lower() in real_lower and n not in real]
for n, r in case:
    warn("case mismatch: JS calls api/%s but the file is api/%s" % (n, r), "fine on Windows/XAMPP, breaks on Linux hosting: rename the file or the call")
if not case: ok("all endpoint names match the file names exactly")
unused = sorted(n for n in real if n not in calls and n.lower() not in {c.lower() for c in calls}
                and n not in ("auth.php", "db.php", "billing_lib.php", "chat_lib.php", "Register.php", "public_units.php", "check_user.php"))
warn("PHP endpoints no JavaScript calls (libraries and public pages are excluded)", ", ".join(unused)) if unused else ok("every endpoint is used by some JavaScript file")

# ------------------------------------------------------------------ 4. role wiring
section("4. Role wiring: landlord pages only call landlord-allowed endpoints, tenant pages only tenant-allowed ones")
def guard(path):
    s = read(path)
    if "require_login()" in s and "ROLE_LANDLORD" not in s.split("require_login()")[0][-0:] and "require_tenant" in s: return "any"
    if "require_tenant(" in s and "require_login()" not in s: return "tenant"
    if "require_role(ROLE_LANDLORD)" in s: return "landlord"
    if "require_login()" in s: return "any"
    return "public"
guards = {os.path.basename(p): guard(p) for p in php_files}
portal = {}
for f in js_files:
    b = os.path.basename(f)
    if b in ("tenant_layout.js", "tenant_dashboard_view.js", "tenant_damage_view.js", "tenant_chat_view.js"): portal[f] = "tenant"
    elif b in ("dashboard_layout.js","dashboard_view.js","units_view.js","tenants_view.js","rent_view.js","expenses_view.js","finance_view.js",
               "billings_view.js","damage_view.js","chat_view.js","unit_model.js","dashboard_model.js","tenant_model.js","rent_model.js",
               "expenses_model.js","finance_model.js","dashboard_controller.js","units_controller.js"): portal[f] = "landlord"
wrong = []
for f, role in portal.items():
    for m in re.finditer(r'api/([A-Za-z0-9_]+\.php)', read(f)):
        g = guards.get(real_lower.get(m.group(1).lower(), ""), None)
        if g is None: continue
        if g not in ("any", "public", role): wrong.append("%s (%s portal) calls %s which is %s-only" % (f, role, m.group(1), g))
(bad if wrong else ok)("no page calls an endpoint its role is not allowed to use", "\n         -> ".join(sorted(set(wrong))))
print("  guard table:", ", ".join("%s=%s" % (k, v) for k, v in sorted(guards.items()) if not k.endswith("_lib.php") and k not in ("auth.php", "db.php")))
leak = [b for b, g in guards.items() if g == "public" and b in ("tenant.php","units.php","rent.php","finance.php","expenses_api.php","billings.php","chat.php","damage_reports.php","tenant_damage.php","tenant_chat.php","tenant_dashboard.php")]
(bad if leak else ok)("no data endpoint is public", ", ".join(leak))

# ------------------------------------------------------------------ 5. PHP include graph
section("5. PHP: every include exists, and every shared function / constant is available where it is used")
inc = {}
for p in php_files:
    src = read(p); b = os.path.basename(p); inc[b] = set(); miss = []
    for m in re.finditer(r"(?:include|require)(?:_once)?\s*\(?\s*(?:__DIR__\s*\.\s*)?['\"]/?([^'\"]+)['\"]", src):
        target = os.path.normpath(os.path.join("api", m.group(1)))
        if os.path.isfile(target): inc[b].add(os.path.basename(target))
        else: miss.append(m.group(1))
    if miss: bad("%s includes a file that does not exist" % b, ", ".join(miss))
if all(True for _ in inc): ok("every include / require target exists")
def closure(b, seen=None):
    seen = seen if seen is not None else set()
    for x in inc.get(b, ()):
        if x not in seen: seen.add(x); closure(x, seen)
    return seen
fdefs, cdefs = {}, {}
for p in php_files:
    s = read(p); b = os.path.basename(p)
    for m in re.finditer(r'^\s*function\s+(\w+)\s*\(', s, re.M): fdefs.setdefault(m.group(1), b)
    for m in re.finditer(r'^\s*const\s+(\w+)\s*=', s, re.M): cdefs.setdefault(m.group(1), b)
unavail = []
for p in php_files:
    s = read(p); b = os.path.basename(p); have = closure(b) | {b}
    code = re.sub(r"/\*.*?\*/", "", s, flags=re.S)          # block comments
    code = re.sub(r"(?m)^\s*(?://|#).*$|(?<=[;{}\s])//[^\n]*", "", code)   # line comments (never swallow the rest of the file)
    for fn, home in fdefs.items():
        if home in have: continue
        if re.search(r'(?<![\w>:$])%s\s*\(' % re.escape(fn), code) and not re.search(r'function\s+%s\b' % fn, code):
            unavail.append("%s calls %s() which lives in %s (not included)" % (b, fn, home))
    for cn, home in cdefs.items():
        if home in have: continue
        if re.search(r'(?<![\w$])%s(?![\w])' % cn, code): unavail.append("%s uses constant %s from %s (not included)" % (b, cn, home))
(bad if unavail else ok)("every shared function / constant a PHP file uses is included by that file", "\n         -> ".join(unavail))

# ------------------------------------------------------------------ 6. database
section("6. Database wiring: tables and new columns used by PHP exist in the migrations")
tables = {"users","units","tenants","contracts","finances","tenant_members","property_expenses","tenant_bills","damage_reports","chat_messages"}
mig = "\n".join(read(p) for p in slashes(glob.glob("database/*.sql")))
mcols = {}
for m in re.finditer(r'CREATE TABLE IF NOT EXISTS (\w+)\s*\((.*?)\)\s*ENGINE', mig, re.S):
    cols = set()
    for line in m.group(2).split("\n"):
        line = line.strip()
        mm = re.match(r'(\w+)\s+(?:INT|VARCHAR|TEXT|ENUM|DATETIME|DECIMAL|TIMESTAMP|TINYINT|DATE)\b', line)
        if mm: cols.add(mm.group(1))
    mcols[m.group(1)] = cols
mcols.setdefault("users", {"gmail","password","names"}).update({"role","tenant_id","must_change_password","notif_seen_at"})
mcols.setdefault("property_expenses", {"category","sub_category","amount","expense_date","description","status","budget_amount","overflow_amount"}).update({"title","unit_id","damage_report_id"})
usedtab, unk = {}, []
for p in php_files:
    for m in re.finditer(r'\b(?:FROM|JOIN|INTO|UPDATE)\s+`?(\w+)`?', read(p)):
        t = m.group(1)
        if t.lower() in ("dual","select","set","values","where","information_schema"): continue
        if t not in tables and not t.isupper() and re.fullmatch(r'[a-z_]+', t) and t not in ("the","a","an","and","this","each","one","all","any","new","your","that","same","now","used","data","tenant","unit"):
            unk.append("%s: %s" % (os.path.basename(p), t))
        usedtab.setdefault(t, set()).add(os.path.basename(p))
(bad if unk else ok)("every table named in a SQL string is a known table", ", ".join(sorted(set(unk))))
badcols = []
for p in php_files:
    for m in re.finditer(r'INSERT(?: IGNORE)? INTO (\w+)\s*\(([^)]+)\)', read(p)):
        t = m.group(1)
        if t in mcols:
            for c in [x.strip() for x in m.group(2).split(",")]:
                if c not in mcols[t]: badcols.append("%s inserts %s.%s but no migration defines it" % (os.path.basename(p), t, c))
(bad if badcols else ok)("every INSERT into a migration-defined table uses columns that exist", "\n         -> ".join(sorted(set(badcols))))
need = {"tenant_bills":"migration_02","damage_reports":"migration_03","chat_messages":"migration_03"}
nomig = [t for t in need if t in usedtab and t not in mcols]
(bad if nomig else ok)("every new table the PHP uses is created by a migration", ", ".join(nomig))
direct = [os.path.basename(p) for p in php_files if "mysqli_connect(" in read(p)]
via_db = [os.path.basename(p) for p in php_files if re.search(r"(?:include|require)(?:_once)?\s*\(?\s*(?:__DIR__\s*\.\s*)?['\"]/?db\.php['\"]", read(p))]
bad_db = [b for b in direct if "integ_admin" not in read("api/" + b)]
(bad if bad_db else ok)("every file that opens its own MySQL connection uses the integ_admin database (%s)" % ", ".join(direct), ", ".join(bad_db))
uses_lib = [os.path.basename(p) for p in php_files if re.search(r"(?:require|include)(?:_once)?[^;]*_lib\.php", read(p))]
nodb = [os.path.basename(p) for p in php_files
        if not p.endswith("_lib.php")                      # libraries receive $con as a function argument
        and (re.search(r"mysqli_(?:query|prepare)|\$con->", code_only(read(p))) or os.path.basename(p) in uses_lib)
        and os.path.basename(p) not in direct + via_db]
(bad if nodb else ok)("every file that runs SQL gets its connection (own connect or include db.php): %d via db.php" % len(via_db), ", ".join(nodb))

# ------------------------------------------------------------------ 7. routes & links
section("7. Routes and menus")
paths = re.findall(r"path:\s*'([^']+)'", route_src)
landlord = ["/landlord/" + c for c in re.findall(r"path:\s*'(\w[\w-]*)',\s*component", route_src.split("path: '/landlord'")[1].split("path: '/tenant'")[0])]
tenant = ["/tenant/" + c for c in re.findall(r"path:\s*'(\w[\w-]*)',\s*component", route_src.split("path: '/tenant'")[1].split("// Old landlord")[0])]
print("  landlord routes:", ", ".join(p.replace("/landlord/","") for p in landlord)); print("  tenant routes:  ", ", ".join(p.replace("/tenant/","") for p in tenant))
def linkset(f): return set(re.findall(r"""(?:to:\s*|to=)['"](/[\w/-]+)['"]""", read(f)))
ll, tl = linkset("View/dashboard_layout.js"), linkset("View/tenant_layout.js")
miss_l = sorted(l for l in ll if l not in landlord); miss_t = sorted(l for l in tl if l not in tenant + landlord)
(bad if miss_l else ok)("every landlord menu link has a route (%d links)" % len(ll), ", ".join(miss_l))
(bad if [l for l in tl if l not in tenant] else ok)("every tenant menu link has a tenant route (%d links)" % len(tl), ", ".join(l for l in tl if l not in tenant))
nomenu = sorted(set(landlord) - ll); (bad if nomenu else ok)("every landlord route has a menu entry", ", ".join(nomenu))
nomenu_t = sorted(set(tenant) - tl); (bad if nomenu_t else ok)("every tenant route has a menu entry", ", ".join(nomenu_t))
pushes = set()
for f in js_files:
    for m in re.finditer(r"""(?:push|replace)\(\s*['"](/[\w/-]+)['"]""", read(f)): pushes.add((f, m.group(1)))
badpush = [f"{f}: {p}" for f, p in pushes if p not in landlord + tenant + ["/login", "/register", "/"]]
(bad if badpush else ok)("every router.push / replace target resolves", ", ".join(badpush))
home = re.findall(r"'(/(?:landlord|tenant)/dashboard)'", read("Router/auth_guard.js"))
(bad if any(h not in landlord + tenant for h in home) else ok)("AuthService.homeFor points at real routes", ", ".join(home))
meta = re.findall(r"path: '/(landlord|tenant)',\s*component: (\w+),\s*meta: \{ role: '(\w+)' \}", route_src)
(bad if not meta or any(a != c for a, _, c in meta) else ok)("each portal route group has the matching meta.role used by the guard", str(meta))
layouts = {b: defs.get(b) for _, b, _ in meta}
(bad if any(v is None for v in layouts.values()) else ok)("both portal layouts exist (%s)" % ", ".join(layouts))

print("\nRESULT: %d passed, %d failed, %d warnings" % (P, F, W))
sys.exit(1 if F else 0)