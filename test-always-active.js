// Quick test script for always-active rule
const { ruleRegistry, alwaysActiveRules } = require('./src/rules');

async function testAlwaysActiveRule() {
  console.log('Testing always-active rules...\n');
  
  // Mock context with config file modified
  const mockContext = {
    files: [
      { filename: '.branchbouncer.yml', status: 'modified' },
      { filename: 'src/index.js', status: 'modified' }
    ]
  };

  for (const ruleId of alwaysActiveRules) {
    const rule = ruleRegistry[ruleId];
    console.log(`Running rule: ${ruleId}`);
    
    const result = await rule.validate(mockContext);
    
    console.log('Result:', result);
    console.log('---\n');
  }

  // Test without config modification
  console.log('Testing WITHOUT config modification...\n');
  
  const mockContext2 = {
    files: [
      { filename: 'src/index.js', status: 'modified' },
      { filename: 'README.md', status: 'modified' }
    ]
  };

  for (const ruleId of alwaysActiveRules) {
    const rule = ruleRegistry[ruleId];
    console.log(`Running rule: ${ruleId}`);
    
    const result = await rule.validate(mockContext2);
    
    console.log('Result:', result);
    console.log('---\n');
  }
}

testAlwaysActiveRule().catch(console.error);
