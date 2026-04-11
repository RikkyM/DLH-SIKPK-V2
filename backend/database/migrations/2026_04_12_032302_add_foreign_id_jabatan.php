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
            $table->after('id', function (Blueprint $table) {
                $table->foreignId('kpa_id')->nullable()->constrained('pegawai_asn')
                    ->cascadeOnUpdate()->nullOnDelete();
                $table->foreignId('bp_id')->nullable()->constrained('pegawai_asn')
                    ->cascadeOnUpdate()->nullOnDelete();
                $table->foreignId('bpp_id')->nullable()->constrained('pegawai_asn')
                    ->cascadeOnUpdate()->nullOnDelete();
                $table->foreignId('pptk_id')->nullable()->constrained('pegawai_asn')
                    ->cascadeOnUpdate()->nullOnDelete();
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jabatan', function (Blueprint $table) {
            $table->dropForeign('kpa_id');
            $table->dropForeign('bp_id');
            $table->dropForeign('bpp_id');
            $table->dropForeign('pptk_id');

            $table->dropColumn([
                'kpa_id',
                'bp_id',
                'bpp_id',
                'pptk_id',
            ]);
        });
    }
};
