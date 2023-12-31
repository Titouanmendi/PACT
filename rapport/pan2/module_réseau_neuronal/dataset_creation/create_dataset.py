# Import libraries
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader

# create custom dataset class


class CustomTextDataset(Dataset):
    def __init__(self, text, labels):
        self.labels = labels
        self.text = text

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        label = self.labels[idx]
        data = self.text[idx]
        sample = {"Text": data, "Class": label}
        return sample


# define data and class labels
text = ['Happy', 'Amazing', 'Sad', 'Unhapy', 'Glum']
labels = ['Positive', 'Positive', 'Negative', 'Negative', 'Negative']

# create Pandas DataFrame
text_labels_df = pd.DataFrame({'Text': text, 'Labels': labels})

# define data set object
TD = CustomTextDataset(text_labels_df['Text'], text_labels_df['Labels'])

# Display image and label.
print('\nFirst iteration of data set: ', next(iter(TD)), '\n')

# Print how many items are in the data set
print('Length of data set: ', len(TD), '\n')

# Print entire data set
print('Entire data set: ', list(DataLoader(TD)), '\n')


# collate_fn
def collate_batch(batch):
    word_tensor = torch.tensor([[1.], [0.], [45.]])
    label_tensor = torch.tensor([[1.]])

    text_list, classes = [], []

    for (_text, _class) in batch:
        text_list.append(word_tensor)
        classes.append(label_tensor)

    text = torch.cat(text_list)
    classes = torch.tensor(classes)

    return text, classes


# create DataLoader object of DataSet object
bat_size = 2
DL_DS = DataLoader(TD, batch_size=bat_size, shuffle=True
                   # collate_fn=collate_batch
                   )
# Shuffle will reshuffle the data at each epoch, this prevents the model from learning the order of training data.


# loop through each batch in the DataLoader object
for (idx, batch) in enumerate(DL_DS):

    # Print the 'text' data of the batch
    print(idx, 'Text data: ', batch["Text"], '\n')

    # Print the 'class' data of batch
    print(idx, 'Class data: ', batch["Class"], '\n')
