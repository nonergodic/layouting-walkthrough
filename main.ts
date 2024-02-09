async function main() {
  console.log("hello world!");
}

main().then(
  () => {
    console.log('completed successfully');
    process.exit();
  },
  err => {
    console.error("failed with error:")
    console.error(err);
    process.exit(-1);
  },
);
