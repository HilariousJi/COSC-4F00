import sys
import json
import time 
import zipfile  
import os 
import shutil
import urllib
import psycopg2
import datetime
import db
import traceback
import socket
import base64

cmd = sys.argv
if len(cmd) < 2:
	print("Error: no argument")
	quit()

cmd = cmd[1].split(".php/")
if not len(cmd) == 2:
	print("Error: URI is too short or does not call .php") 
	quit()

cmd = urllib.unquote(cmd[1])
cmd = cmd.split("/");

cnx = db.get_connection()
cursor = cnx.cursor()

# https://stackoverflow.com/questions/1855095/how-to-create-a-zip-archive-of-a-directory
def zipdir(path, ziph):
	# ziph is zipfile handle
	for root, dirs, files in os.walk(path):
		for file in files:
			absname = os.path.join(root, file)
			# adjust arcname if want a containing folder
			arcname = absname[len(path):]
			ziph.write(absname, arcname)

query = False
if cmd[0] == 'newass':
	if (cmd[3] == ""):
		query = ("INSERT INTO Assignment (course, name) " +
    		 "VALUES (" + cmd[1] + ", '" + cmd[2] + "')")
	else:
		query = ("INSERT INTO Assignment (course, name, closing) " +
    		 "VALUES (" + cmd[1] + ", '" + cmd[2] + "', '" + cmd[3] + "')")
elif cmd[0] == 'upass':
	# api.php/upass/<assignment id>/<updated assignment name>/<updated assignment closing date>
	# updates an assignment name and / or closing date
	if cmd[3] == "":
		query = ("UPDATE Assignment SET name = '" + cmd[2] + "', closing = NULL WHERE id = " + cmd[1])
	else:
		query = ("UPDATE Assignment SET name = '" + cmd[2] + "', closing = '" + cmd[3] + "' WHERE id = " + cmd[1])
elif cmd[0] == 'delass':
	# api.php/delass/<assignment id>
	# deletes an assignment
	query = ("DELETE FROM Assignment WHERE id = " + cmd[1])
elif cmd[0] == 'password':
	# api.php/password/<account id>/<new password>
	# updates a password
	query = ("UPDATE Account SET password = '" + cmd[2] + "' WHERE id = '" + cmd[1] + "'")
	
if query:
	success, records = db.exec_and_parse(cursor, cnx, query)
	print(json.dumps(records))

if cmd[0] == 'send':
	# "./api.php/send/<course id>/<assignment id>;
	# log it in the database
	query = ("INSERT INTO ReportRequest (course, assignment) " +
		    "VALUES (" +
		    "'" + cmd[1] + "', " +
		    "'" + cmd[2] + "')")
	success, records = db.exec_and_parse(cursor, cnx, query)
	query = "SELECT currval('reportrequest_id_seq')"
	success, records = db.exec_and_parse(cursor, cnx, query)
	rid = records[0]['currval']
	# zip everything up
	zip_name = "c" + cmd[1] + "a" + cmd[2] + "r" + str(rid) + ".zip"
	dest_path = "./requests/" + zip_name
	src_path = "./uploads/" + cmd[1] + "/" + cmd[2] + "/"
	zipf = zipfile.ZipFile(dest_path, 'w', zipfile.ZIP_DEFLATED)
	zipdir(src_path, zipf)
	zipf.close()
	# send to the algo server
	s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	try:
		s.connect(('localhost', 1234)) # the same port as used by the server
		msg = bytes(dest_path)
		size = ("0000" + str(len(msg)))[-4:]
		s.sendall(size)
		s.sendall(msg)
		f = open(dest_path, "rb")
		msg = urllib.quote(base64.b64encode(f.read()))
		# can only handle up to a trillion bytes, but thats ~ 1 gb
		size = ("000000000000" + str(len(msg)))[-12:]
		f.close()
		s.sendall(size)
		s.sendall(msg)

		#s.settimeout(2)
		#data = s.recv(1024)
		#print('Received', repr(data))
	except:
		print(json.dumps(traceback.format_exc()))
	finally:
		s.close()
elif cmd[0] == 'exportass':
	src = "./uploads/" + cmd[1] + "/" + cmd[2] + "/target/"
	if not os.path.isdir(src):
		print(json.dumps("nothing to export"))
		quit()
	zip_name = "./exports/" + "c" + cmd[1] + "a" + cmd[2] + ".zip"
	zipf = zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED)
	zipdir(src, zipf)
	zipf.close()
	print(json.dumps(zip_name))
elif cmd[0] == 'includezip':
	zip_path = os.path.join(".", "uploads", cmd[1], cmd[2], "repository")
	try:
		zip_ref = zipfile.ZipFile(zip_path + "/" + cmd[3], 'r')
		zip_ref.extractall(zip_path)
		zip_ref.close()
	except:
		print(json.dumps(traceback.format_exc()))
		quit()
	# remove original zip file
	os.remove(zip_path + "/" + cmd[3])	
	# DELETE ALL FILES IN THE ZIP PATH
	# JUST IN CASE THEY UPLOADED A BAD ZIP?
	print(json.dumps(True))

cnx.close()
