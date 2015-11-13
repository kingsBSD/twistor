# Blah blah, Docker isn't real sysadmin, get off my lawn, don't deploy this anywhere public-facing, ever: http://iops.io/blog/docker-hype/

# make a Twitter app: https://apps.twitter.com/
# edit config.json
# build: sudo docker build -t twistor twistor/
# run: sudo docker run --name twistor -v /var/lib/postgres/data -p 8081:8081 -t -i twistor
# gawp: http:localhost:8081

FROM debian:jessie
MAINTAINER Giles Richard Greenway

RUN echo 'deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main 9.5' >> /etc/apt/sources.list
RUN apt-get -q -y update
RUN DEBIAN_FRONTEND=noninteractive apt-get -q -y --force-yes --fix-missing install curl make postgresql-9.5 supervisor

RUN curl --location https://deb.nodesource.com/setup_4.x | bash -
RUN DEBIAN_FRONTEND=noninteractive apt-get -q -y --fix-missing install --yes nodejs

USER postgres
RUN    /etc/init.d/postgresql start && psql --command "CREATE USER twistor WITH PASSWORD 'twistor';" 
RUN    /etc/init.d/postgresql start && psql --command "CREATE DATABASE twistor OWNER twistor;" 
USER root 

ADD . / 

RUN npm install
RUN make

CMD /usr/bin/supervisord