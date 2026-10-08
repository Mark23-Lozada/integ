-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 09, 2026 at 12:36 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `integ_admin`
--
CREATE DATABASE IF NOT EXISTS `integ_admin` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `integ_admin`;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `sender_role` enum('landlord','tenant') NOT NULL,
  `body` varchar(1000) NOT NULL,
  `created_at` datetime NOT NULL,
  `read_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `tenant_id`, `sender_role`, `body`, `created_at`, `read_at`) VALUES
(1, 31, 'tenant', 'hell po', '2026-10-09 06:30:45', '2026-10-09 06:31:11'),
(2, 31, 'landlord', 'kamusta po yung pag lipat nyo', '2026-10-09 06:31:29', '2026-10-09 06:33:38');

-- --------------------------------------------------------

--
-- Table structure for table `contracts`
--

CREATE TABLE `contracts` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `unit_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `contract_months` int(11) NOT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `downpayment_amount` decimal(10,2) NOT NULL,
  `downpayment_status` varchar(50) DEFAULT 'Unpaid',
  `contract_status` enum('Active','Expired','Renewed','Terminated') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contracts`
--

INSERT INTO `contracts` (`id`, `tenant_id`, `unit_id`, `start_date`, `end_date`, `contract_months`, `monthly_rent`, `downpayment_amount`, `downpayment_status`, `contract_status`, `created_at`) VALUES
(33, 31, 5, '2026-10-15', '2027-10-15', 12, 7000.00, 5000.00, 'Partial', 'Active', '2026-10-08 22:28:21');

-- --------------------------------------------------------

--
-- Table structure for table `damage_reports`
--

CREATE TABLE `damage_reports` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `photo` varchar(100) DEFAULT NULL,
  `status` enum('Pending','In Progress','Resolved') NOT NULL DEFAULT 'Pending',
  `landlord_note` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `resolved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `finances`
--

CREATE TABLE `finances` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `contract_id` int(11) DEFAULT NULL,
  `tenant_name` varchar(255) NOT NULL,
  `unit_name` varchar(100) NOT NULL,
  `payment_type` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL,
  `status` varchar(50) DEFAULT 'Paid',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `finances`
--

INSERT INTO `finances` (`id`, `tenant_id`, `contract_id`, `tenant_name`, `unit_name`, `payment_type`, `amount`, `payment_date`, `status`, `created_at`) VALUES
(16, 31, 33, 'amara guzmin', '101', 'Downpayment', 5000.00, '2026-10-09 06:28:21', 'Paid', '2026-10-08 22:28:21');

-- --------------------------------------------------------

--
-- Table structure for table `property_expenses`
--

CREATE TABLE `property_expenses` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL COMMENT 'Utilities, Supplies, Repairs, Admin/Others',
  `sub_category` varchar(100) NOT NULL COMMENT 'Hal. Meralco (Kuryente), Maynilad (Tubig), PLDT (WiFi)',
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `expense_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Pending','Approved') NOT NULL DEFAULT 'Pending' COMMENT 'Kapag-click ng approve, ibabawas sa finances',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `budget_amount` decimal(12,2) DEFAULT NULL,
  `overflow_amount` decimal(12,2) DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `damage_report_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `property_expenses`
--

INSERT INTO `property_expenses` (`id`, `category`, `sub_category`, `amount`, `expense_date`, `description`, `status`, `created_at`, `budget_amount`, `overflow_amount`, `title`, `unit_id`, `damage_report_id`) VALUES
(12, 'Utilities', 'Electricity', 1000.00, '2026-10-09', '', 'Pending', '2026-10-08 22:33:05', NULL, NULL, 'Electricity', 5, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int(11) NOT NULL,
  `fullname` varchar(150) NOT NULL,
  `birthdate` date NOT NULL,
  `gender` varchar(20) NOT NULL,
  `contact_no` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT '',
  `province_address` text NOT NULL,
  `valid_id_type` varchar(50) NOT NULL,
  `valid_id_number` varchar(50) NOT NULL,
  `emergency_contact_name` varchar(150) NOT NULL,
  `emergency_contact_no` varchar(20) NOT NULL,
  `unit_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `contract_months` int(11) DEFAULT 6,
  `downpayment_status` varchar(20) DEFAULT 'Unpaid',
  `downpayment_amount` decimal(10,2) DEFAULT 0.00,
  `status` varchar(20) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `fullname`, `birthdate`, `gender`, `contact_no`, `email`, `province_address`, `valid_id_type`, `valid_id_number`, `emergency_contact_name`, `emergency_contact_no`, `unit_id`, `start_date`, `contract_months`, `downpayment_status`, `downpayment_amount`, `status`) VALUES
(31, 'amara guzmin', '2006-03-31', 'Male', '09811967882', 'amara18@gmail.com', 'B72 L37 Golden Horizon', 'PhilSys National ID', '1234567890123456', 'rene', '09123456789', 5, '2026-10-15', 12, 'Partial', 5000.00, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `tenant_bills`
--

CREATE TABLE `tenant_bills` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `contract_id` int(11) NOT NULL,
  `installment_no` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tenant_bills`
--

INSERT INTO `tenant_bills` (`id`, `tenant_id`, `contract_id`, `installment_no`, `amount`, `due_date`, `created_at`) VALUES
(79, 31, 33, 1, 7000.00, '2026-11-15', '2026-10-08 22:28:21'),
(80, 31, 33, 2, 7000.00, '2026-12-15', '2026-10-08 22:28:21'),
(81, 31, 33, 3, 7000.00, '2027-01-15', '2026-10-08 22:28:21'),
(82, 31, 33, 4, 7000.00, '2027-02-15', '2026-10-08 22:28:21'),
(83, 31, 33, 5, 7000.00, '2027-03-15', '2026-10-08 22:28:21'),
(84, 31, 33, 6, 7000.00, '2027-04-15', '2026-10-08 22:28:21'),
(85, 31, 33, 7, 7000.00, '2027-05-15', '2026-10-08 22:28:21'),
(86, 31, 33, 8, 7000.00, '2027-06-15', '2026-10-08 22:28:21'),
(87, 31, 33, 9, 7000.00, '2027-07-15', '2026-10-08 22:28:21'),
(88, 31, 33, 10, 7000.00, '2027-08-15', '2026-10-08 22:28:21'),
(89, 31, 33, 11, 7000.00, '2027-09-15', '2026-10-08 22:28:21'),
(90, 31, 33, 12, 7000.00, '2027-10-15', '2026-10-08 22:28:21');

-- --------------------------------------------------------

--
-- Table structure for table `tenant_members`
--

CREATE TABLE `tenant_members` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `fullname` varchar(150) NOT NULL,
  `relationship` varchar(50) NOT NULL,
  `member_age` int(11) NOT NULL,
  `valid_id_info` varchar(100) DEFAULT '',
  `birthdate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `downpayment` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `kitchenImage` varchar(255) DEFAULT NULL,
  `diningImage` varchar(255) DEFAULT NULL,
  `isOccupied` tinyint(1) DEFAULT 0,
  `tenantName` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'Available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `name`, `type`, `rate`, `downpayment`, `description`, `image`, `kitchenImage`, `diningImage`, `isOccupied`, `tenantName`, `created_at`, `status`) VALUES
(5, '101', 'Standard Room', 7000.00, 5000.00, '', 'uploads/1791005705_9420_1789883797_6975_d18d084ca0bd4d99deadc7c15efcee03.jpg', 'uploads/1791005705_2358_1789629583_4339_17215a9b66b12eb6cfb6d65f02b85c30.jpg', 'uploads/1791005705_4968_1789891411_6412_fcfc9338d22b86b12b0a19ff53a06370.jpg', 1, 'amara guzmin', '2026-10-03 05:35:05', 'Occupied');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `gmail` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `names` varchar(150) NOT NULL,
  `role` enum('landlord','tenant') NOT NULL DEFAULT 'landlord',
  `tenant_id` int(11) DEFAULT NULL,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `notif_seen_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `gmail`, `password`, `created_at`, `names`, `role`, `tenant_id`, `must_change_password`, `notif_seen_at`) VALUES
(2, 'brixguzman501@gmail.com', '$2y$10$w6i7EuUNIjNqfvREgG3IL.1wigd51HKu.hsoqhwJA6wpz3xchTqSi', '2026-10-03 04:55:21', 'Brix Brandy', 'landlord', NULL, 0, NULL),
(3, 'amara18@gmail.com', '$2y$10$sziPVnXtnfKmH1Ee3O/lBusxP3V6HnQq1RH1pWVDtdfcgZr23Yxna', '2026-10-08 22:28:21', 'amara guzmin', 'tenant', 31, 0, '2026-10-09 06:33:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chat_thread` (`tenant_id`,`id`),
  ADD KEY `idx_chat_unread` (`sender_role`,`read_at`);

--
-- Indexes for table `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indexes for table `damage_reports`
--
ALTER TABLE `damage_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_damage_tenant` (`tenant_id`),
  ADD KEY `idx_damage_status` (`status`);

--
-- Indexes for table `finances`
--
ALTER TABLE `finances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_finances_contract` (`contract_id`);

--
-- Indexes for table `property_expenses`
--
ALTER TABLE `property_expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_expense_unit` (`unit_id`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_fullname` (`fullname`),
  ADD UNIQUE KEY `unique_contact` (`contact_no`),
  ADD UNIQUE KEY `unique_valid_id` (`valid_id_number`),
  ADD UNIQUE KEY `unique_emergency_name` (`emergency_contact_name`),
  ADD UNIQUE KEY `unique_emergency_contact` (`emergency_contact_no`),
  ADD UNIQUE KEY `unique_address` (`province_address`(255)),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD KEY `fk_tenant_unit` (`unit_id`);

--
-- Indexes for table `tenant_bills`
--
ALTER TABLE `tenant_bills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_bill_contract_no` (`contract_id`,`installment_no`),
  ADD KEY `idx_bill_tenant_due` (`tenant_id`,`due_date`);

--
-- Indexes for table `tenant_members`
--
ALTER TABLE `tenant_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_member_tenant` (`tenant_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`gmail`),
  ADD UNIQUE KEY `uq_users_tenant` (`tenant_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `contracts`
--
ALTER TABLE `contracts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `damage_reports`
--
ALTER TABLE `damage_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `finances`
--
ALTER TABLE `finances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `property_expenses`
--
ALTER TABLE `property_expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `tenant_bills`
--
ALTER TABLE `tenant_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `tenant_members`
--
ALTER TABLE `tenant_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contracts`
--
ALTER TABLE `contracts`
  ADD CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tenants`
--
ALTER TABLE `tenants`
  ADD CONSTRAINT `fk_tenant_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tenant_members`
--
ALTER TABLE `tenant_members`
  ADD CONSTRAINT `fk_member_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
