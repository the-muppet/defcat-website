#!/bin/bash

find docs -name "*.md" -type f -exec sed -i 's/<br\/>/<br>/g' {} +