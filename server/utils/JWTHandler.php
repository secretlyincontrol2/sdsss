<?php

class JWTHandler {
    private static $secret;
    private static $expiry = 86400; // 24 hours

    private static function getSecret() {
        if (!self::$secret) {
            self::$secret = getenv('JWT_SECRET') ?: 'fyp_system_secret_key_change_in_production';
        }
        return self::$secret;
    }

    public static function encode($payload) {
        $header = self::base64UrlEncode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));

        $payload['iat'] = time();
        $payload['exp'] = time() + self::$expiry;
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", self::getSecret(), true)
        );

        return "$header.$payloadEncoded.$signature";
    }

    public static function decode($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        $expectedSig = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", self::getSecret(), true)
        );

        if (!hash_equals($expectedSig, $signature)) {
            return null;
        }

        $data = json_decode(self::base64UrlDecode($payload), true);

        if (!$data || !isset($data['exp']) || $data['exp'] < time()) {
            return null;
        }

        return $data;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
