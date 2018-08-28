import os
from sqlalchemy import (create_engine, Table, Column, Integer, String, MetaData, ForeignKey)
from flask import Flask, render_template, request, json
app = Flask(__name__)
app.config['REQUEST_MAIN'] = 'sqlite:////tmp/test.db'

# Serve the primary page
@app.route('/main')
def main():
    return render_template('/main.html')

# Handle request
@app.route('/mainRequest', methods=['POST'])

# Pass to SQL
def mainRequest():
    theData = request.get_json(force=True)
    insertRequest(theData)

    msg = ["Data submitted"]
    return json.dumps(msg)

if __name__=="__main__":
    app.run()

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