#!/bin/bash
VAR=$(date +%Y-%m-%d)
source ~/.bash_profile
echo "exit" | sqlplus hr/hr@orcl @/home/oracle/WebstormProjects/StockUi/delonlinedatas.sql
node /home/oracle/WebstormProjects/StockUi/stock.js $VAR $VAR
