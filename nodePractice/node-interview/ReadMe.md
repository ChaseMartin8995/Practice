### NodeJs challenge instructions

The task is to take all files located in files/original folder, rename them,
append 4 pieces of information to the files, then finally move them to files/moved folder.


The files should be renamed according to the following naming convention:

```
[original file name]_edited_[year-month-day_hour-second]
```

(The hour is in 24 hour format)

Make sure you use the file's original file extension. 

The files should be appended with the following 4 pieces of information:

1. The original name of the file
2. The original file path
3. The new name of the file
4. The new file path

For JSON files, the 4 pieces of information above must be added as properties
to the JSON file. Any other file type should be treated as a txt file, and
the information should be appended at the end of the file as new lines.


Example:

say we have a file called files/original/test.txt and
files/original/test.json


*test.txt*
``` 
this is a test file
```

*test.json*
```
{
  "foo": "bar"
}
```

The files should be renamed to something like:

*test_edited_2017-10-19_13-34.txt*
```
this is a test file
test.txt
./files/original
test_edited_2017-10-19_13-34.txt
./files/moved
```


*test_edited_2017-10-19_13-34.json*
```
{
  "foo": "bar",
  "originalName": "test.json",
  "originalPath": "./files/original",
  "newFileName": "test_edited_2017-10-19_13-34.json",
  "newFilePath": "./files/moved"
}
```
