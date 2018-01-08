# OpenID

An open ID ------, hosted on [Google App Engine](https://cloud.google.com/appengine/). 

## OpenID flow 


## Installation 

Be sure that you have [Python 2.7](https://www.python.org/downloads/) and [pip](https://pypi.python.org/pypi/pip) installed on your computer. 
Also, you need the [Google Cloud SDK](https://cloud.google.com/sdk/docs/) installed and configured.

#### Step 1 - Clone this repo

Clone this repo on your working directory running the following command: 

```
git clone https://github.com/mgviz/openid
```

#### Step 2 - Install the dependencies

`cd` to the project folder and install python dependencies in the `lib` folder by running the following commands: 

```shell 
pip install -t lib -r requirements.txt
```

#### Step 3 - Configure the OpenID

Rename the file `config.sample.py` to `config.py`. Then, edit it with your custom configuration. 

#### Step 4 - Test it

Now you can test the OpenID by running the following command: 

```
dev_appserver.py app.yaml 
```

Open a new browser window and navigate to `localhost:8080`. 


## License 

[MIT LICENSE](./LICENSE) &copy; 2017 ----.


