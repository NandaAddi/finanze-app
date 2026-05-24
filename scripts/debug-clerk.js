const dotenv = require('dotenv');
dotenv.config();

const { clerkClient } = require('@clerk/nextjs/server');

async function run() {
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: ['muhammad.naufal.2301216@students.um.ac.id']
    });

    console.log('--- CLERK USER METADATA ---');
    if (users.data && users.data.length > 0) {
      const user = users.data[0];
      console.log('User ID:', user.id);
      console.log('Email:', user.emailAddresses[0]?.emailAddress);
      console.log('Public Metadata:', user.publicMetadata);
    } else {
      console.log('No user found in Clerk with that email');
    }
  } catch (err) {
    console.error(err);
  }
}

run();
