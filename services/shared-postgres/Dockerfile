FROM library/postgres

#COPY databases/model-api.sh /docker-entrypoint-initdb.d/
#COPY databases/tasks-api.sh /docker-entrypoint-initdb.d/

ENV TASKS_API_PASSWORD=tasks_api_password
ENV MODEL_API_PASSWORD=model_api_password

COPY ./entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["postgres"]
