import mysql.connector

def db_conexao():
    return mysql.connector.connect(
        host='db',
        database='almoxarifado',
        user='root',
        password='mysql_root',
        port='3306'
    )