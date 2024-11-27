# Get the database URL from environment variable
$env:DATABASE_URL = "postgresql://toowired:vzSdHyZncBGSqiWwAadqzw@toowired-cockroach-3121.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=system"

# Path to the migration file
$migrationFile = Join-Path $PSScriptRoot "migrations\001_update_context_schema.sql"

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "Found psql command"
} catch {
    Write-Error "psql command not found. Please install PostgreSQL client tools."
    exit 1
}

# Run the migration
try {
    Write-Host "Running database migration..."
    $result = psql $env:DATABASE_URL -f $migrationFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration completed successfully"
    } else {
        Write-Error "Migration failed with exit code $LASTEXITCODE"
        Write-Host $result
    }
} catch {
    Write-Error "Error running migration: $_"
    exit 1
}
