<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        User::create([
            'username' => 'admin',
            'password' => 'Dlh!@#2023',
            'role'     => 'superadmin'
        ]);

        User::create([
            'department_id' => 12,
            'username'      => 'kalidoni',
            'password'      => '123456',
            'role'          => 'operator'
        ]);
    }
}
