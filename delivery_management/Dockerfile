FROM python:3.7.3

RUN mkdir /usr/src/app
WORKDIR /usr/src/app
COPY ./requirements.txt .

EXPOSE 4000
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
ENV PYTHONUNBUFFERED 1
COPY . .
