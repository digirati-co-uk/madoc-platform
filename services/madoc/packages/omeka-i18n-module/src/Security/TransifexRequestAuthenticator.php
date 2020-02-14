<?php

namespace i18n\Security;

final class TransifexRequestAuthenticator
{
    /**
     * Create a new TransifexRequestAuthenticator.
     *
     * @param string $secretKey a private key used to sign and authenticate messages
     */
    public function __construct(string $secretKey)
    {
        $this->secretKey = $secretKey;
    }

    /**
     * Check if a request from Transifex signed using the given {@code url}, {@code date}, and {@code content}
     * is valid for the secret key.
     *
     * @return bool {@code true} if the request was signed with the secret key, {@code false} otherwise
     */
    public function authenticate(string $signature, string $url, string $date, string $content): bool
    {
        $message = join(PHP_EOL, [$url, $date, md5($content)]);
        $expectedSignature = base64_encode(hash_hmac('sha256', $message, $this->secretKey, true));

        return hash_equals($expectedSignature, $signature);
    }
}
