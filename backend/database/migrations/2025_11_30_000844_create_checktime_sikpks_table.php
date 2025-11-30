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
        Schema::create('checktime_sikpk', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('old_id');
            $table->unsignedBigInteger('userid');
            $table->datetime('checktime');
            $table->char('checktype', 2)->nullable();
            $table->integer('verifycode');
            $table->string('SN')->nullable();
            $table->string('sensorid', 5)->nullable();
            $table->string('WorkCode', 20)->nullable();
            $table->string('Reserved', 20)->nullable();
            // $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checktime_sikpk');
    }
};
