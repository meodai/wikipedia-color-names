# wikipedia-color-names 📚

Up to date list of sanitized wikipedia color names.

The build script (`npm run build`) is fetching a new list of color names 
from wikipedia and sanitizes it. 

- Lower-cases the hex color values
- Removes parentheses 
- Removes duplicates color names
- Title Cases the color names

[colors.json](colors.json) contains an array of objects with a name, hex and link property.

## Latest Color Names 🔖

![Wikipedia Color Names](colors.svg "List of wikipedia colors")
