# Set the DATABASE_URL environment variable
$env:DATABASE_URL = "postgresql://toowired:vzSdHyZncBGSqiWwAadqzw@toowired-cockroach-3121.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=system"

# Navigate to the project directory
Set-Location -Path "C:\Users\LEWIS\WindsurfProjects\windsurf-vex"

# Compile TypeScript files
Write-Host "Compiling TypeScript files..."
npm run compile

# Run the extension in development mode
Write-Host "Launching VS Code with extension..."
code . -g README.md

# Wait for user input to close
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
