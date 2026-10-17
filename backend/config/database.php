<?php

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

class Database
{
    private Client $client;
    private $database;

    public function __construct()
    {
        $mongoUri = getenv('MONGODB_URI') ?: 'mongodb://127.0.0.1:27017';
        $this->client = new Client($mongoUri);

        $this->database = $this->client->selectDatabase('hirehub');
    }

    public function getDatabase()
    {
        return $this->database;
    }
}