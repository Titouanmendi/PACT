import tensorflow as tf
import numpy as np

x = []
y = []
for _ in range(10000):
    num = np.random.randint(0, 101)  # generate random integer
    x.append(num)
    y.append(num % 2)

# build model architecture
model = tf.keras.Sequential()
model.add(tf.keras.layers.Dense(input_shape=(1,),
                                units=64,
                                activation='sigmoid'))
model.add(tf.keras.layers.Dense(32, 'sigmoid'))
model.add(tf.keras.layers.Dense(16, 'sigmoid'))
model.add(tf.keras.layers.Dense(8, 'sigmoid'))
model.add(tf.keras.layers.Dense(1, 'sigmoid'))

model.compile('adam', 'binary_crossentropy')  # compile

model.fit(x, y, epochs=100)  # train

model.save('model_py/model.h5')
