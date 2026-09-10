#!/bin/bash

# Commands to push SMRS project to GitHub
# Run these commands one by one in your terminal

cd /home/egovridc27/Desktop/SEAN/projects/advanced/projects/desktop-softwares/SMRS

echo "Step 1: Remove existing remote (if any)"
git remote remove origin

echo "Step 2: Add GitHub repository as origin"
git remote add origin https://github.com/compiller25/SHRMS.git

echo "Step 3: Verify remote was added"
git remote -v

echo "Step 4: Push to GitHub (this may ask for authentication)"
git push -u origin main

echo "Done! Your code is now on GitHub"
echo "Check: https://github.com/compiller25/SHRMS"
