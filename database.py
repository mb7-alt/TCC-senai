import mysql.connector

def db_conexao():
    return mysql.connector.connect(
        host='localhost',
        database='almoxarifado',
        user='root',
        password='',
        port='3307'
    )