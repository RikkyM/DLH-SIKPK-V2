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
        Schema::create('pegawai', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('old_id')->unique();
            $table->unsignedBigInteger('id_department')->nullable()->index();
            $table->unsignedBigInteger('id_penugasan')->nullable()->index();
            $table->unsignedBigInteger('id_shift')->nullable()->index();
            $table->unsignedBigInteger('id_korlap')->nullable()->index();
            $table->string('badgenumber', 30)->index();
            $table->string('nama', 50)->index();
            $table->string('tempat_lahir', 90)->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('jenis_kelamin', ['laki-laki', 'perempuan'])->nullable();
            $table->string('gol_darah', 10)->nullable();
            $table->string('alamat', 255)->nullable();
            $table->string('rt', 3)->nullable();
            $table->string('rw', 3)->nullable();
            $table->string('kelurahan', 50)->nullable();
            $table->string('kecamatan', 50)->nullable();
            $table->string('kota')->nullable();
            $table->string('agama', 100)->nullable();
            $table->string('status_perkawinan', 50)->nullable();
            $table->string('upload_ktp', 100)->nullable();
            $table->string('upload_kk', 100)->nullable();
            $table->string('upload_pas_foto', 100)->nullable();
            $table->string('foto_lapangan', 100)->nullable();
            $table->string('rute_kerja')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pegawai');
    }
};
