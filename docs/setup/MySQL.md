# MySQL Setup
Guide through setting up MySQL server on local machine.

## 1. Download
https://dev.mysql.com/downloads/

Select *MySQL Community Server*. The community version is free under GNU public license.

Note: For Apple Silicon, chose the ARM 64 DMG version.

## 2. Install
Run the downloaded installer and follow the steps. You will be asked to set a root password.

Add the mysql binaries to the system PATH so they can be accessed via terminal.
For Unix-based systems, it’s usually under `/usr/local/mysql/bin`.
```shell
# Adds the export command to the end of .bashrc.
# Change to .zshrc if using zsh.
echo 'export PATH=/usr/local/mysql/bin:$PATH' | tee -a ~/.bashrc
```

## 3. Create Database and User
Commands for reference:
https://dev.mysql.com/doc/refman/8.0/en/mysql-commands.html

```shell
# Connect to the MySQL isntance as root user:
mysql -u root -p
# Enter the root password when prompted.

# Create a database. Should match the one listed in spring.datasource.url in src/main/resources/application.properties.
# Semi-colons are required at the end of each command.
mysql> CREATE DATABASE <database_name>;

# Create a user and grant privileges to the database.
mysql> CREATE USER '<username>'@'localhost' IDENTIFIED BY '<password>';

mysql> GRANT ALL ON <database_name>.* TO '<username>'@'localhost';

# All done.
mysql> exit
```

## 4. Update Env Variables
This may be slightly confusing.

Copy this file `.env.example` -> `.env` if it doesn't already exist.

Update the DB credentials inside to match the database and user created in the previous step.

Docker uses `.env` to load vars when setting up the container.

But running locally, Spring Boot uses `env.properties` to load vars on startup.

You don't need to duplicate the variables in both files.
Instead, create a symbolic link from `.env` to `env.properties`:
```shell
# From the root directory of the project.
ln -s .env env.properties
```
Now whatever you do to one, happens to the other, and they will stay in sync.
