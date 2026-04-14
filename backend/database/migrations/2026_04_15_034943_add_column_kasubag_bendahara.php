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
        Schema::table('jabatan', function (Blueprint $table) {
            $table->after('pptk_id', function (Blueprint $table) {
                $table->foreignId('kasubbag_id')->nullable()
                    ->constrained('pegawai_asn')
                    ->cascadeOnUpdate()
                    ->nullOnDelete();
            });
            $table->string('kasubbag_keuangan')->nullable()->after('pptk');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jabatan', function (Blueprint $table) {
            $table->dropForeign(['kasubbag_id']);

            $table->dropColumn(['kasubbag_id', 'kasubbag_keuangan']);
        });
    }
};
