const fs = require('fs');

// File path to your JSON data
const filePath = 'c:\\Users\\Administrator\\Downloads\\yuki_2.json';

// Read the JSON data from the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Parse the JSON data into a JavaScript object
  try {
    const jsonData = JSON.parse(data);

    // Initialize variables to store the counts
    let totalBodyshots = 0;
    let totalLegshots = 0;
    let totalHeadshots = 0;

    // Access the player data directly
    if (jsonData && jsonData.data) {
      const matches = jsonData.data;

      for (const match of matches) {
        if (match.stats) {
          const shots = match.stats.shots;
          totalBodyshots += shots.body;
          totalLegshots += shots.leg;
          totalHeadshots += shots.head;
        }
      }

      // Calculate the total shots fired
      const totalShotsFired = totalBodyshots + totalLegshots + totalHeadshots;

      // Check for division by zero
      if (totalShotsFired === 0) {
        console.log('No shots fired, cannot calculate headshot percentage.');
      } else {
        // Calculate the headshot percentage
        const headshotPercentage = (totalHeadshots / totalShotsFired) * 100;

        // Output the results
        console.log(`Total Bodyshots: ${totalBodyshots}`);
        console.log(`Total Legshots: ${totalLegshots}`);
        console.log(`Total Headshots: ${totalHeadshots}`);
        console.log(`Headshot Percentage: ${headshotPercentage.toFixed(2)}%`);
      }
    } else {
      console.log('JSON structure does not match expectations.');
    }
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }
});
