FROM python:latest

ADD . .

# Python
RUN pip install -r requirements.txt

# Node
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash
RUN apt-get install -y build-essential nodejs
RUN npm install
RUN npm run build
RUN npm install -g serve

EXPOSE 5000
EXPOSE 5001

CMD serve -s build -p 5001 & python api.py
