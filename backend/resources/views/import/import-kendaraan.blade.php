<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Import Kendaraan</title>
</head>

<body>
    <form action={{ route('import-kendaraan') }} method="POST" enctype="multipart/form-data">
        @csrf

        <div>
            <label for="file" style="display: block;">File Data Kendaraan</label>
            <input type="file" id="file" name="file">
        </div>
        <button type="submit">Submit</button>
    </form>
</body>

</html>
