#!/usr/bin/env node

/**
 * Demo script to populate the DevOps LogSense dashboard with sample data
 * Run this script to see the dashboard in action with realistic log data
 */

const BASE_URL = 'http://localhost:3000';

async function loadDemoData() {
  console.log('📤 Loading demo data...');

  const response = await fetch(`${BASE_URL}/api/demo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load demo data: ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`✅ Successfully loaded ${result.logsLoaded} demo logs`);
  return result;
}

async function getAnalytics() {
  console.log('\n📊 Fetching analytics...');

  const response = await fetch(`${BASE_URL}/api/analytics`);

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  const analytics = await response.json();
  console.log('\n📈 Analytics Summary:');
  console.log(`   Total Logs: ${analytics.totalLogs}`);
  console.log(`   Errors: ${analytics.errorCount}`);
  console.log(`   Warnings: ${analytics.warningCount}`);
  console.log('\n   Categories:');
  Object.entries(analytics.categorySummary).forEach(([category, count]) => {
    if (count > 0) {
      console.log(`   - ${category}: ${count}`);
    }
  });
  console.log('\n   Sources:');
  Object.entries(analytics.sourceSummary).forEach(([source, count]) => {
    if (count > 0) {
      console.log(`   - ${source}: ${count}`);
    }
  });

  return analytics;
}

async function runDemo() {
  console.log('🚀 DevOps LogSense - Demo Data Loader\n');
  console.log('This script will populate your dashboard with sample log data.');
  console.log(`Server: ${BASE_URL}\n`);

  try {
    // Load demo data
    await loadDemoData();

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Fetch and display analytics
    await getAnalytics();

    console.log('\n✨ Demo completed successfully!');
    console.log(`\n🌐 Open your browser to ${BASE_URL} to see the dashboard\n`);
  } catch (error) {
    console.error('\n❌ Error running demo:', error.message);
    console.error('\nMake sure the dev server is running: npm run dev\n');
    process.exit(1);
  }
}

runDemo();
