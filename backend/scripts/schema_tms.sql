CREATE TABLE IF NOT EXISTS `Application` (
  `App_Acronym` VARCHAR(50),
  `App_Description` TEXT,
  `App_Rnumber` INT NOT NULL,
  `App_startDate` INT NOT NULL,
  `App_endDate` INT NOT NULL,
  `App_permit_Create` VARCHAR(50),
  `App_permit_Open` VARCHAR(50),
  `App_permit_toDoList` VARCHAR(50),
  `App_permit_Doing` VARCHAR(50),
  `App_permit_Done` VARCHAR(50),
  PRIMARY KEY (`App_Acronym`)
) ENGINE = INNODB DEFAULT CHARSET = UTF8;

CREATE TABLE IF NOT EXISTS `Plan`(
  `Plan_MVP_name` VARCHAR(255),
  `Plan_app_Acronym` VARCHAR(50) NOT NULL,
  `Plan_startDate` INT NOT NULL,
  `Plan_endDate` INT NOT NULL,
  -- Includes #
  `Plan_color` VARCHAR(7),
  FOREIGN KEY (`Plan_app_Acronym`) REFERENCES Application(`App_Acronym`) ON DELETE CASCADE,
  PRIMARY KEY (`Plan_MVP_name`)
) ENGINE = INNODB DEFAULT CHARSET = UTF8;

CREATE TABLE IF NOT EXISTS `Task` (
  `Task_id` VARCHAR(100),
  `Task_plan` VARCHAR(255) DEFAULT NULL,
  `Task_app_Acronym` VARCHAR(50) NOT NULL,
  `Task_name` VARCHAR(255) NOT NULL,
  `Task_description` TEXT,
  `Task_notes` MEDIUMTEXT,
  `Task_state` VARCHAR(10) NOT NULL,
  `Task_creator` VARCHAR(50) NOT NULL,
  `Task_owner` VARCHAR(50) NOT NULL,
  `Task_createDate` INT NOT NULL,
  FOREIGN KEY (`Task_plan`) REFERENCES Plan (`Plan_MVP_name`) ON DELETE
  SET
    NULL,
    FOREIGN KEY (`Task_app_Acronym`) REFERENCES Application (`App_Acronym`) ON DELETE CASCADE,
    PRIMARY KEY (`Task_id`)
) ENGINE = INNODB DEFAULT CHARSET = UTF8;