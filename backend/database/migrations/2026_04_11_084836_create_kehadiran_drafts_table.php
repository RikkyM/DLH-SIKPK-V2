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
        Schema::create('kehadiran_drafts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('old_id')->nullable()->unique();
            $table->unsignedBigInteger('pegawai_id')->nullable();
            $table->string('nik', 30)->nullable();
            $table->string('nama')->nullable();
            $table->datetime('check_time');
            // $table->enum('check_type', [0, 1, 2])->nullable()->comment('0 = masuk, 1 = keluar, 2 = lembur');
            $table->char('check_type', 2)->nullable();
            $table->string('nama_department')->nullable();
            $table->string('jabatan')->nullable();
            $table->integer('gaji')->nullable();
            $table->string('shift_kerja')->nullable();
            $table->time('jam_masuk')->nullable();
            $table->time('jam_keluar')->nullable();
            $table->json('telat')->nullable();
            $table->json('pulang_cepat')->nullable();
            $table->integer('upah_kerja')->nullable();
            $table->integer('potongan_upah_kerja')->nullable();
            // $table->time('lama_telat')->nullable();
            $table->text('keterangan')->nullable();
            $table->string('bukti_dukung')->nullable();
            $table->enum('status', ['pending', 'approve', 'reject']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kehadiran_drafts');
    }
};
