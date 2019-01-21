import os
import sql
from flask import Flask, render_template, request, json
app = Flask(__name__)
app.config['REQUEST_MAIN'] = 'sqlite:////tmp/test.db'

# Serve the primary page
@app.route('/main')
def main():
    return render_template('/main.html')

# Handle request
@app.route('/mainRequest', methods=['GET','POST'])

# Pass to SQL
def mainRequest():
    theData = request.get_json(force=True)
    sql.insertRequest(theData)

    msg = ["Data submitted"]
    return json.dumps(msg)

if __name__=="__main__":
    app.run()