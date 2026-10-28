<?php
require __DIR__ . '/../frank.php';
foreach ([401, 403, 429, 400, 404, 500] as $status) {
    try {
        frank_provider_error($status, 'model list');
        throw new Exception('Expected a diagnostic');
    } catch (RuntimeException $error) {
        if (!str_contains($error->getMessage(), 'HTTP ' . $status)) {
            throw new Exception('Missing provider status');
        }
    }
}
echo "Provider status diagnostics passed. No upstream request.\n";
