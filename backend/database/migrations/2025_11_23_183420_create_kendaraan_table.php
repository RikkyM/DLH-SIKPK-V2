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
        Schema::create('kendaraan', function (Blueprint $table) {
            $table->id();
            $table->string('no_tnkb')->comment('no tnkb / no polisi');
            $table->foreignId('id_jenis_kendaraan')
                ->nullable()
                ->constrained('jenis_kendaraan')
                ->nullOnDelete();
            $table->string('merk');
            $table->string('lambung');
            $table->string('no_rangka');
            $table->string('no_mesin');
            $table->string('tahun_pembuatan');
            $table->string('kondisi');
            $table->string('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kendaraan');
    }
};
