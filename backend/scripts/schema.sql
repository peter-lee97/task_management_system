CREATE DATABASE IF NOT EXISTS `tms` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

USE `tms`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100),
  `accountStatus` VARCHAR(30) DEFAULT 'active',
  PRIMARY KEY (`username`)
) ENGINE = INNODB DEFAULT CHARSET = UTF8;

CREATE TABLE IF NOT EXISTS `UserGroup` (
  `username` VARCHAR(50) DEFAULT '',
  `user_group` VARCHAR(50) NOT NULL,
  CONSTRAINT pk_user_group PRIMARY KEY (`user_group`, `username`)
) ENGINE = INNODB DEFAULT CHARSET = UTF8;