const mysqlssh = require("mysql-ssh");
const config = require("./config");
const moment = require("moment");
const csvWriter = require("csv-write-stream");
const fs = require("fs");

mysqlssh
	.connect(config.ssh, config.mysql)
	.then(client => {
		client.query(
			"show status where `variable_name` = 'Threads_connected'",
			(err, results, fields) => {
				if (err) throw err;

				var writer = csvWriter({ sendHeaders: false, separator: ";" });
				writer.pipe(
					fs.createWriteStream(
						path.resolve(
							__dirname,
							moment().format("YYYYMMDD") + ".csv"
						),
						{
							flags: "a"
						}
					)
				);
				writer.write({
					date: moment().toISOString(),
					connections: parseInt(results[0].Value)
				});
				writer.end();

				mysqlssh.close();
			}
		);
	})
	.catch(err => {
		console.log(err);
	});
