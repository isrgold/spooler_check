New-Item -ItemType Directory -Path src/dist -Force

Get-ChildItem src -Recurse -File -Include *.html,*.css,*.js | ForEach-Object {
    $inputFile = $_.FullName
    $outputFile = "src/dist/$($_.BaseName)$($_.Extension)"
    
    # Print the command to log
    Write-Output "Minifying: $inputFile -> $outputFile"

    # Execute the command
    minify $inputFile > $outputFile

    # Check if the command was successful
    if ($?) {
        Write-Output "Successfully minified: $outputFile"
    } else {
        Write-Output "Failed to minify: $inputFile"
    }
}
