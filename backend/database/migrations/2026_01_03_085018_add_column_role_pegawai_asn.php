<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pegawai_asn', function (Blueprint $table) {
            $table->after('id', function (Blueprint $table) {
                $table->unsignedBigInteger('id_department')->nullable();
            });
            $table->after('unit_kerja', function (Blueprint $table) {
                $table->enum('role', ['KABID', 'KATIM', 'KUPTD', 'KASUBBAG', 'BENDAHARA', 'OPERATOR', 'SEKRETARIAT'])->nullable();
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pegawai_asn', function (Blueprint $table) {
            $table->dropColumn(['id_department', 'role']);
        });
    }
};
