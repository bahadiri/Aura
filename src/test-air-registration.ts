import { atmosphere } from '../atmosphere';

// Test script to verify all AIRs are registered
console.log('=== AIR Registration Test ===');
const allAIRs = atmosphere.getAll();
console.log(`Total registered AIRs: ${allAIRs.length}`);

allAIRs.forEach(air => {
    console.log(`- ${air.id}: ${air.meta.title} (${air.meta.icon})`);
});

// Test specific lookup
const tasksAIR = atmosphere.get('tasks-air');
if (tasksAIR) {
    console.log('\n✅ tasks-air is registered!');
    console.log(` - Title: ${tasksAIR.meta.title}`);
    console.log(` - Icon: ${tasksAIR.meta.icon}`);
    console.log(` - Description: ${tasksAIR.meta.description}`);
} else {
    console.error('\n❌ tasks-air NOT FOUND!');
}

export { };
