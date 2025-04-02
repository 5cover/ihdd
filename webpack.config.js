import * as path from 'path';

/** @var {import('webpack').Configuration} */
const cfg = {
    entry: {
        ihdd: './src/ts/ihdd.ts',
        'evento-view': './src/ts/evento-view.ts',
    },
    output: {
        filename: '[name].js',
        path: path.resolve('docs/js'),
    },
    mode: 'development',
    resolve: {
        extensions: ['.ts', '.js'], // Resolve both .ts and .js files
    },
    module: {
        rules: [
            {
                test: /\.ts$/, // Match .ts files
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
};

export default cfg;