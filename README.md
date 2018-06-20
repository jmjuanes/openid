# PassFort



## PassFort flow 



## Installation 

Be sure that you have [Python 2.7](https://www.python.org/downloads/) and [pip](https://pypi.python.org/pypi/pip) installed on your computer. 
Also, you need the [Google Cloud SDK](https://cloud.google.com/sdk/docs/) installed and configured.

#### Step 1 - Clone this repo

Clone this repo on your working directory running the following command: 

```
git clone https://github.com/siimple/passfort
```

#### Step 2 - Install the dependencies

`cd` to the project folder and install python dependencies in the `lib` folder by running the following commands: 

```shell 
# Install Node.js dependencies
cd client && npm install

# Install Python dependencies
pip install -t lib -r requirements.txt
```

#### Step 3 - Configure PassFort

Rename and move the file `config.sample.py` to `src/config.py` and edit it with your custom configuration. 

#### Step 4 - Build the client

Run the following command to build the client:

```shell
cd client && npm run build
```

#### Step 5 - Run and test

Now you can test **PassFort** by running the following command: 

```
dev_appserver.py app.yaml 
```

Open a new browser window and navigate to `http://localhost:8080`. 


## License 

[MIT LICENSE](./LICENSE) &copy; 2017-2018.


