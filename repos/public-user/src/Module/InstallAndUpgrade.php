<?php

namespace PublicUser\Module;

use Zend\ServiceManager\ServiceLocatorInterface;

trait InstallAndUpgrade
{
    public function upgrade($oldVersion, $newVersion, ServiceLocatorInterface $serviceLocator)
    {
        // Add the user_invitation table for 1.1.0
        if (version_compare($oldVersion, '1.1.0') === -1) {
            $connection = $serviceLocator->get('Omeka\Connection');
            $query = '
               CREATE TABLE IF NOT EXISTS user_invitations (
                  id                  INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
                  invitation_id       VARCHAR(40) NOT NULL,
                  owner_id            INT(11),
                  site_id             int(11) NOT NULL,
                  role                varchar(80) NOT NULL,
                  site_role           varchar(80) NOT NULL,
                  expires             TIMESTAMP NOT NULL,
                  created_at          TIMESTAMP NOT NULL,
                  uses_left           INT,
                  message             VARCHAR(4000),
                  CONSTRAINT `user_invitations__owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `user_invitations__site_id` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`) ON DELETE CASCADE
               );
            ';
            $connection->exec($query);
        }
    }

    public function install(ServiceLocatorInterface $serviceLocator)
    {
        $connection = $serviceLocator->get('Omeka\Connection');

        $sql = ['
            CREATE TABLE IF NOT EXISTS user_canvas_mapping (
              id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
              canvas_mapping_id INT,
              user_id INT,
              bookmarked INT,
              complete_count INT,
              incomplete_count INT,
              FOREIGN KEY (canvas_mapping_id) REFERENCES resource(id),
              FOREIGN KEY (user_id) REFERENCES user(id),
              CONSTRAINT uc_user_canvas UNIQUE (user_id, canvas_mapping_id)
            );
            ', '
            CREATE TABLE IF NOT EXISTS oauth_access_tokens (
              access_token  VARCHAR(40) NOT NULL,
              client_id     VARCHAR(80),
              user_id       VARCHAR(80),
              expires       TIMESTAMP NOT NULL,
              scope         VARCHAR(4000),
              PRIMARY KEY (access_token)
            );
            ', '
            CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
              authorization_code   VARCHAR(40) NOT NULL,
              client_id            VARCHAR(80),
              user_id              VARCHAR(80),
              redirect_uri         VARCHAR(2000) NOT NULL,
              expires              TIMESTAMP NOT NULL,
              scope                VARCHAR(4000),
              PRIMARY KEY (authorization_code)
            );
            ', '
            CREATE TABLE IF NOT EXISTS user_invitations (
              id                  INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
              invitation_id       VARCHAR(40) NOT NULL,
              owner_id            INT(11),
              site_id             int(11) NOT NULL,
              role                varchar(80) NOT NULL,
              site_role           varchar(80) NOT NULL,
              expires             TIMESTAMP NOT NULL,
              created_at          TIMESTAMP NOT NULL,
              uses_left           INT,
              message             VARCHAR(4000),
              CONSTRAINT `user_invitations__owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
              CONSTRAINT `user_invitations__site_id` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`) ON DELETE CASCADE
            );
            '
        ];

        foreach ($sql as $query) {
            try {
                $connection->exec($query);
            } catch (Throwable $e) {
            }
        }
    }
}
