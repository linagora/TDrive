#!/bin/bash
# Script to create selfsigned certificates if they don't exist. All certificate
# information can be customized using env variables.
# Licence: GPL
# Note: derivated from https://gitlab.com/live9/docker/containers/openssl/-/blob/master/entrypoint
#
set -eo pipefail
[ "${DEBUG}" = "yes" ] && set -x

SSL_PATH="/etc/nginx/ssl/"
SSL_KEY="${SSL_PATH}/selfsigned.key"
SSL_CERT_REQUEST="${SSL_PATH}/selfsigned.csr"
SSL_CERTIFICATE="${SSL_PATH}/selfsigned.crt"
SSL_DHPARAM_FILE="${SSL_PATH}/dhparam.pem"

# Certificate creation params
SSL_VALID_DAYS="${SSL_VALID_DAYS:-365}"
SSL_SUBJ_COUNTRY="${SSL_SUBJ_COUNTRY:-FR}"
SSL_SUBJ_STATE="${SSL_SUBJ_STATE:-Hauts-de-France}"
SSL_SUBJ_LOCALITY="${SSL_SUBJ_LOCALITY:-Paris}"
SSL_SUBJ_ORG="${SSL_SUBJ_ORG:-Linagora}"
SSL_SUBJ_ORG_UNIT="${SSL_SUBJ_ORG_UNIT:- Twake}"
SSL_SUBJ_CN="${SSL_SUBJ_CN:-localhost}"
SSL_SUBJECT="/C=${SSL_SUBJ_COUNTRY}/ST=${SSL_SUBJ_STATE}/L=${SSL_SUBJ_LOCALITY}/O=${SSL_SUBJ_ORG}/OU=${SSL_SUBJ_ORG_UNIT}/CN=${SSL_SUBJ_CN}"
SSL_KEY_LENGTH=${SSL_KEY_LENGTH:-2048}


if [ ! -f ${SSL_CERTIFICATE} ]; then
  echo "Creating certificate sigining request..."
  mkdir -p ${SSL_PATH}
  openssl req \
            -newkey rsa:${SSL_KEY_LENGTH} \
            -sha256 \
            -nodes \
            -keyout ${SSL_KEY} \
            -out ${SSL_CERT_REQUEST} \
            -subj "${SSL_SUBJECT}"
  echo "Creating self-signed certificate..."
  openssl x509 -req -days ${SSL_VALID_DAYS} \
               -in ${SSL_CERT_REQUEST} \
               -signkey ${SSL_KEY} \
               -out ${SSL_CERTIFICATE}

  echo "Creating dhparam file..."
  # When SSL_DHPARAM_FILE is present the whole process is done
  openssl dhparam -out ${SSL_DHPARAM_FILE}.tmp ${SSL_KEY_LENGTH}
  mv ${SSL_DHPARAM_FILE}.tmp ${SSL_DHPARAM_FILE}

  echo "Done."
else
  echo "Selfsigned certificate already exists, skipping."
fi
