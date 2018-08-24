
from sqlalchemy import (create_engine, Table, Column, Integer, String, MetaData, ForeignKey)

def insertRequest(data):   
    # kickoff engine
    engine = create_engine('sqlite:///:memory:', echo=True)
    metadata = MetaData()

    # create table
    requests = Table('requests', metadata,
        Column('title', String(200)),
        Column('desc', String(2000)),
        Column('clientid', String(100)),
        Column('priority', Integer),
        Column('tdate', String(14)),
        Column('parea', String(100))
    )

    metadata.create_all(engine)

    # insert new row
    theinsert = requests.insert().values(title=data['title'], desc=data['desc'], clientid=data['clientid'], priority=data['priority'], tdate=data['tdate'], parea=data['parea'])

    conn = engine.connect()
    conn.execute(theinsert)


