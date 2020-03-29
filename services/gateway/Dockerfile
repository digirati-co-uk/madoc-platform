FROM tykio/tyk-gateway:latest

COPY ./gateway.conf /opt/tyk-gateway/tyk.conf
COPY ./policies.json /opt/tyk-gateway/policies/policies.json
COPY ./services /opt/tyk-gateway/apps

COPY ./entrypoint.sh /opt/custom/custom-entrypoint.sh

ENTRYPOINT ["/opt/custom/custom-entrypoint.sh"]
