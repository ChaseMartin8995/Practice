import sys
import logging
import rds_config
import pymysql
from sqlalchemy import (create_engine, Table, Column, Integer, String, MetaData, ForeignKey)
#rds settings
rds_host  = "requestdb.ckn7tlauelat.us-east-2.rds.amazonaws.com"
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

logger = logging.getLogger()
logger.setLevel(logging.INFO)

conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=10)


logger.info("SUCCESS: Connection to RDS mysql instance succeeded")
def handler(event, context):

    item_count = 0

    with conn.cursor() as cur:
        cur.execute('insert into Employee3 (EmpID, Name) values(1, "Joe")')
        cur.execute('insert into Employee3 (EmpID, Name) values(2, "Bob")')
        cur.execute('insert into Employee3 (EmpID, Name) values(3, "Mary")')
        conn.commit()
        cur.execute("select * from Employee3")
        for row in cur:
            item_count += 1
            logger.info(row)
            #print(row)            
    conn.commit()
 
    return "Added %d items from RDS MySQL table" %(item_count)

def insertRequest(data):   
    # kickoff engine
    engine = create_engine('requestdb.ckn7tlauelat.us-east-2.rds.amazonaws.com', echo=True)
    metadata = MetaData()    

    # create table
    requests = Column('title', String(200)), Column('desc', String(2000)), Column('clientid', String(100)), Column('priority', Integer), Column('tdate', String(14)), Column('parea', String(100)))

    metadata.create_all(engine)

    # insert new row
    theinsert = requests.insert().values(title=data['title'], desc=data['desc'], clientid=data['clientid'], priority=data['priority'], tdate=data['tdate'], parea=data['parea'])

    conn = engine.connect()
    conn.commit(theinsert)