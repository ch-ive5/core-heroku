from flask import Flask, Response, render_template, request, redirect, url_for
from threading import Thread
from datetime import datetime
from pytz import timezone
import time
import smtplib
import os


app = Flask(__name__)


SENDER = os.getenv("SENDER")
SENDER_PASS = os.getenv("SENDER_PASS")
RECIPIENT = os.getenv("RECIPIENT")


def admin_alert(subject, message):
    pacific_tz = timezone("US/Pacific")
    time_to_format = datetime.fromtimestamp(time.time(), tz=pacific_tz)
    second = round(float(time_to_format.strftime("%S.%f")), 2)
    formatted_datetime = time_to_format.strftime(f"%Y-%m-%d %H:%M:{second}")
    message = f'{formatted_datetime}\nCore\n{message}\n{time.time()}'

    connection = smtplib.SMTP("smtp.mail.yahoo.com", port=587)  # or port=465
    connection.starttls()  # Make connection secure
    connection.login(user=SENDER, password=SENDER_PASS)
    connection.sendmail(
        from_addr=SENDER,
        to_addrs=RECIPIENT,
        msg=f"Subject: {subject}\n\n{message}"
    )
    connection.close()


def admin_alert_thread(subject, message):
    alert_args = [subject, message]
    alert_thread = Thread(target=admin_alert, args=alert_args)
    alert_thread.start()


@app.errorhandler(404)
def page_not_found(e):
    if not request.path.startswith('/favicon.ico') and not request.path.startswith('/robots'):
        message_body = f'404 Redirect\n{request.url}\nPage not found. Rendered main.html.'
        admin_alert_thread('Web App - ERROR', message_body)
        return render_template("main.html"), 404


@app.route('/serverterminal', methods=['POST'])
def server_terminal():
    if request.method == 'POST':
        if 'userstartmsec' not in request.form or 'usersecs' not in request.form:
            message_list = ['Bad request to server_terminal.', 'POST arguments below.']
            for item in request.form:
                message_line = f'{item}: {request.form[item]}'
                message_list.append(message_line)
            message = '\n'.join(message_list)
            admin_alert_thread('Web App - ERROR', message)
            return Response(status=400)
        user_start_msec = request.form['userstartmsec']
        user_secs = request.form['usersecs']
        message = f'User Time Log\nUser timestamp id: {user_start_msec}\n' \
                  f'User duration: {user_secs} seconds'
        admin_alert_thread('Web App - Log', message)
        return Response(status=200)


@app.route('/favicon.ico')
def favicon():
    return redirect(url_for('static', filename='favicon.ico'))


@app.route('/')
def play():
    return render_template("main.html")


if __name__ == "__main__":
    app.run()
