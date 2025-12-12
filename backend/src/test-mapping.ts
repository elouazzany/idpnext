
import { MappingService } from './services/mapping.service';

const mappingService = MappingService.getInstance();

async function runTests() {
  console.log('Starting MappingService tests...');

  const payload = {
    repository: {
      name: 'service-demo',
      language: 'TypeScript'
    }
  };

  // Test 1: selector.query = "true"
  const yaml1 = `
resources:
  - kind: repository
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .repository.name
          title: .repository.name
          blueprint: '"service"'
`;
  console.log('\nTest 1 (query: "true"):');
  const res1 = await mappingService.transform(payload, 'repository', yaml1);
  console.log('Result:', res1.length === 1 ? 'PASS' : 'FAIL', res1);

  // Test 2: selector.query filtering (MATCH)
  const yaml2 = `
resources:
  - kind: repository
    selector:
      query: .repository.name | startswith("service")
    port:
      entity:
        mappings:
          identifier: .repository.name
          title: .repository.name
          blueprint: '"service"'
`;
  console.log('\nTest 2 (query match):');
  const res2 = await mappingService.transform(payload, 'repository', yaml2);
  console.log('Result:', res2.length === 1 ? 'PASS' : 'FAIL', res2);

  // Test 3: selector.query filtering (NO MATCH)
  const yaml3 = `
resources:
  - kind: repository
    selector:
      query: .repository.name | startswith("api")
    port:
      entity:
        mappings:
          identifier: .repository.name
          title: .repository.name
          blueprint: '"service"'
`;
  console.log('\nTest 3 (query no match):');
  const res3 = await mappingService.transform(payload, 'repository', yaml3);
  console.log('Result:', res3.length === 0 ? 'PASS' : 'FAIL', res3);

  // Test 4: Missing selector (Default true)
  const yaml4 = `
resources:
  - kind: repository
    port:
      entity:
        mappings:
          identifier: .repository.name
          title: .repository.name
          blueprint: '"service"'
`;
  console.log('\nTest 4 (missing selector):');
  const res4 = await mappingService.transform(payload, 'repository', yaml4);
  console.log('Result:', res4.length === 1 ? 'PASS' : 'FAIL', res4);
}

runTests().catch(console.error);
